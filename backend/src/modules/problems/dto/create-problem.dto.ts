import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsObject, IsInt, Min } from 'class-validator';
import { Difficulty } from '@prisma/client';

export class CreateProblemDto {
  @ApiProperty({ example: 'clx1abc' })
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 'Two Sum' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'two-sum' })
  @IsString()
  slug: string;

  @ApiProperty({ enum: Difficulty, required: false })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({ example: 'Given an array of integers...' })
  @IsString()
  descriptionMd: string;

  @ApiProperty({ required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  examples?: any[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  solutions?: Record<string, string>;

  @ApiProperty({ required: false, type: [Object] })
  @IsOptional()
  @IsArray()
  hints?: any[];

  @ApiProperty({ required: false, example: 2000 })
  @IsOptional()
  @IsInt()
  @Min(100)
  timeLimit?: number;

  @ApiProperty({ required: false, example: 256 })
  @IsOptional()
  @IsInt()
  @Min(16)
  memoryLimit?: number;
}
