import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { BoardService } from "./board.service";
import { CreatePostDto, UpdatePostDto } from "./dto/post.dto";
import { CreateCommentDto } from "./dto/comment.dto";

@Controller("api/board")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  createPost(@Body() createBoardDto: CreatePostDto) {
    return this.boardService.create(createBoardDto);
  }

  @Get()
  getPostLists(@Query("pageNum") pageNum: number) {
    return this.boardService.findAll(pageNum);
  }

  @Get(":id")
  getPost(@Param("id") id: string) {
    return this.boardService.getPost(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateBoardDto: UpdatePostDto) {
    return this.boardService.update(+id, updateBoardDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.boardService.remove(+id);
  }

  @Get(":id/comment")
  async getComments(@Param("id") id: string) {
    return await this.boardService.getComments(+id);
  }
  // @Get("test/:id")
  // async getCommentsByParentId(@Param("id") id: number) {
  //   return await this.boardService.getCommentsByParentId(id);
  // }

  @Post(":id/comment")
  createComment(
    @Param("id") id: string,
    @Body() createCommentDto: CreateCommentDto
  ) {
    return this.boardService.createComment(createCommentDto);
  }
}
