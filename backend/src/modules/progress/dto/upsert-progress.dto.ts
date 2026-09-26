import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProgressStatus } from '@prisma/client';

export class UpsertProgressDto {
  @ApiProperty({ description: '题目 ID' })
  @IsUUID()
  problemId: string;

  @ApiProperty({ enum: ProgressStatus, required: false })
  @IsOptional()
  @IsEnum(ProgressStatus)
  status?: ProgressStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100_000)
  code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50_000)
  notes?: string;
}
