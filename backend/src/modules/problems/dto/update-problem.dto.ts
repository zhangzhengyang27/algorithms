import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsObject, IsInt, Min } from 'class-validator';
import { Difficulty } from '@prisma/client';

export class UpdateProblemDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ enum: Difficulty, required: false })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descriptionMd?: string;

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(100)
  timeLimit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(16)
  memoryLimit?: number;
}
