import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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

  async getList(pageNum?: number, limit?: number) {
    let skip = 1;
    let take = 5;
    if (pageNum! > 0) skip = 5 * Number(pageNum! - 1);
    if (limit) take = Number(limit);
    try {
      const item = await this.prismaService.post.findMany({
        take,
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
        where: { published: true }, //비밀글처리 할지 아예 안보이게 할지 고민
        orderBy: { id: "desc" },
      });

      const postLength = await this.prismaService.post.count({
        // where: { published: true },
      });
      const result = {
        item: item.map((post) => ({
          ...post,
          commentCount: post.comments.length,
        })),
        totalPage: Math.ceil(postLength / 5),
        totalPost: postLength,
        pageNum: Number(pageNum),
      };

      return result;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          return { item: [], totalPage: 0, totalPost: 0, pageNum: 0 };
        } else if (e.code === "P2002") {
          console.log("P2002", e.code);
        }
      }
    }
  }

  async getPost(id: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new HttpException(
        "게시글이 존재하지 않습니다.",
        HttpStatus.NOT_FOUND
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
    console.log(id, password);

    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    if (!post || post!.password !== password) {
      throw new HttpException(
        "비밀번호가 일치하지 않습니다.",
        HttpStatus.UNAUTHORIZED
      );
    } else {
      return this.prismaService.post.update({
        where: { id },
        data: { published: false },
      });
    }
  }
}
