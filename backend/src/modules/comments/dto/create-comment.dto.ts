import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: '9c1e1b0e-6a2b-4d3c-8f5a-1e2d3c4b5a69' })
  @IsUUID()
  problemId: string;

  @ApiProperty({ example: '今天用单调栈把这题打卡了' })
  @IsString()
  @MaxLength(5000, { message: 'content is too long (max 5000 chars)' })
  content: string;
}
