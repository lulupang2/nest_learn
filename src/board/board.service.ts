import { Injectable } from "@nestjs/common";
import { CreateBoardDto } from "./dto/create-board.dto";
import { UpdateBoardDto } from "./dto/update-board.dto";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BoardService {
  constructor(private prismaService: PrismaService) {}
  create(createBoardDto: CreateBoardDto) {
    const { title, content, author, password } = createBoardDto;
    return this.prismaService.post.create({
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

  async findOne(id: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id },
    });
    await this.prismaService.post.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    return post;
  }

  update(id: number, updateBoardDto: UpdateBoardDto) {
    return `This action updates a #${id} board`;
  }

  remove(id: number) {
    return `This action removes a #${id} board`;
  }
}
// 50개
// 5개씩
// 10페이지
// 1번째 페이지 46~50
// 2번째 페이지 41~45
// 3번째 페이지 36~40
// 4번째 페이지 31~35
// 5번째 페이지 26~30
// 6번째 페이지 21~25
// 7번째 페이지 16~20
// 8번째 페이지 11~15
// 9번째 페이지 6~10
// 10번째 페이지 1~5
// total 50
// limit 5
// 50/5 = 10
