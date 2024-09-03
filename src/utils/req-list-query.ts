import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class PaginationDto {
  @IsInt()
  @Min(10)
  @Max(100)
  @ApiProperty({
    minimum: 1,
    maximum: 100,
    default: 100,
    type: Number,
    description: '条数',
    required: false,
  })
  pageSize = 10;

  @IsInt()
  @Min(1)
  @ApiProperty({
    minimum: 1,
    default: 1,
    type: Number,
    description: '页数',
    required: false,
  })
  pageNo = 1;
}
