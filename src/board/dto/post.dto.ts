import { ApiProperty } from "@nestjs/swagger";
export type PostType = {
  id?: number;
  title: string;
  author: string;
  content: string;
  password: string;
  like?: number;
  dislike?: number;
  views?: number;
  published?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  comments?: Comment[];
};

export class CreatePostDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  author: string;

  @ApiProperty()
  password: string;
}

export class UpdatePostDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  password: string;
}
