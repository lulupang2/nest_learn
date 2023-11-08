import { Injectable } from "@nestjs/common";
import { CreatePostDto, UpdatePostDto } from "./dto/post.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCommentDto } from "./dto/comment.dto";
import _ from "lodash";
@Injectable()
export class BoardService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBoardDto: CreatePostDto) {
    const { title, content, author, password } = createBoardDto;
    return await this.prismaService.post.create({
      data: {
        title,
        content,
        author,
        password,
      },
    });
  }

  async findAll(pageNum: number) {
    const skip = pageNum != 0 ? 5 * Number(pageNum - 1) : 0;

    const item = await this.prismaService.post.findMany({
      take: 5,
      skip,
      where: { published: true },
      orderBy: { id: "desc" },
    });
    const postLength = await this.prismaService.post.count({
      where: { published: true },
    });
    const result = {
      item,
      totalPage: Math.ceil(postLength / 5),
      totalPost: postLength,
      pageNum: Number(pageNum),
    };

    return result;
  }

  async getPost(id: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    await this.prismaService.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    const comments = await this.getComments(id);

    const commentSize = await this.prismaService.comment.count({
      where: { postId: id },
    });

    // for (const comment of comments) {
    //   if (comment.parentId) {
    //     comment.children = await this.getCommentsByParentId(comment.id);
    //   }
    // }

    return { post, comments, commentSize };
  }
  async createComment(createCommentDto: CreateCommentDto) {
    const { author, content, password, postId, parentId } = createCommentDto;
    const comment = await this.prismaService.comment.create({
      data: {
        author,
        content,
        password,
        postId,
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

  remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
