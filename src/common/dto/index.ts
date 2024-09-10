// 时间区间对象

import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class DateParamsDto {
  @ApiProperty({
    type: Date,
    description: '开始时间',
  })
  @IsDateString()
  beginTime: string;
  @ApiProperty({
    type: Date,
    description: '结束时间',
  })
  @IsDateString()
  endTime: string;
}

export class PaginDto {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsNumberString()
  @IsOptional()
  pageNo?: number;

  @ApiProperty({ required: false, default: 10, maximum: 50 })
  @IsNumberString()
  @IsOptional()
  pageSize?: number;
}
