import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { BoardService } from "./board.service";
import { CreatePostDto, UpdatePostDto } from "./dto/post.dto";
import { CreateCommentDto } from "./dto/comment.dto";

@Controller("board")
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Post()
  createPost(@Body() createBoardDto: CreatePostDto) {
    return this.boardService.create(createBoardDto);
  }

  @Get()
  getPostLists(
    @Query("pageNum") pageNum: number,
    @Query("limit") limit: number
  ) {
    return this.boardService.getList(pageNum, limit);
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
  deletePost(
    @Param("id") id: number,
    @Body("password") password: string,
    @Req() request: Request
  ) {
    console.log(request);

    return this.boardService.deletePost(+id, password);
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
