import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreatePostDto, UpdatePostDto } from "./dto/post.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCommentDto } from "./dto/comment.dto";
import _ from "lodash";
import { Prisma } from "@prisma/client";
@Injectable()
export class BoardService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBoardDto: CreatePostDto) {
    const { title, content, author, password } = createBoardDto;
    const data = await this.prismaService.post.create({
      data: {
        title,
        content,
        author,
        password,
      },
    });
    return {
      id: data.id,
      title: data.title,
      content: data.content,
    };
  }

  async getList({
    pageNum = 1,
    search,
    type,
  }: {
    pageNum?: number;
    limit?: number;
    search?: string;
    type?: string;
  }) {
    const skip = pageNum > 0 ? (pageNum - 1) * 5 : 0;
    const where = search
      ? type === "all"
        ? {
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
              { author: { contains: search } },
            ],
          }
        : { [type!]: { contains: search } }
      : {};

    const [postLength, item] = await Promise.all([
      this.prismaService.post.count({ where }),
      this.prismaService.post.findMany({
        take: 5,
        skip,
        select: {
          id: true,
          title: true,
          author: true,
          createdAt: true,
          views: true,
          published: true,
          comments: true,
        },
        ...(search && type && { where }),
        orderBy: { id: "desc" },
      }),
    ]);

    if (!item.length)
      throw new NotFoundException("게시글이 존재하지 않습니다.");

    return {
      item: item.map((post) => ({
        ...post,
        commentCount: post.comments.length,
      })),
      totalPage: Math.ceil(postLength / 5),
      totalPost: postLength,
      pageNum,
    };
  }

  async getPost(id: number) {
    // try {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException(
        `해당하는 게시글이 존재하지 않습니다. id: ${id}`
      );
    }
    await this.prismaService.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    const comments = await this.getComments(id);

    const commentSize = await this.prismaService.comment.count({
      where: { postId: id },
    });

    return { post, comments, commentSize };
    // } catch (e) {
    //   console.log(e.response.message);
    // }
  }

  async createComment(createCommentDto: CreateCommentDto) {
    const { author, content, password, postId, parentId } = createCommentDto;
    const comment = await this.prismaService.comment.create({
      data: {
        author,
        content,
        password,
        postId: Number(postId),
        parentId: parentId ? parentId : null,
      },
    });

    return comment;
  }

  async getComments(postId: number, parentId: number | null = null) {
    const comments = await this.prismaService.comment.findMany({
      where: {
        postId: postId,
        parentId: parentId,
      },
      include: {
        children: true,
      },
    });

    for (const comment of comments) {
      comment.children = await this.getComments(postId, comment.id);
    }

    return comments;
  }

  private async getCommentsByParentId(id: number) {
    const comments = await this.prismaService.comment.findMany({
      where: { parentId: Number(id) },
      include: {
        children: true,
      },
    });
    for (const comment of comments) {
      if (comment.children) {
        comment.children = await this.getCommentsByParentId(comment.id);
      }
    }

    return comments;
  }

  async getComment(id: number) {
    return await this.prismaService.comment.findMany({
      where: {
        postId: {
          equals: id,
        },
      },
      include: {
        parent: true,
      },
    });
  }

  update(id: number, updateBoardDto: UpdatePostDto) {
    return `This action updates a #${id} board`;
  }

  async deletePost(id: number, password: any) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    console.log(post, password);

    if (post!.password === password) {
      return await this.prismaService.post.delete({
        where: { id },
      });
    } else {
      throw new HttpException(
        "비밀번호가 일치하지 않습니다.",
        HttpStatus.UNAUTHORIZED
      );
    }
  }
}
