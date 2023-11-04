import { ApiProperty } from "@nestjs/swagger";

export class CreateBoardDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  password: string;
}
