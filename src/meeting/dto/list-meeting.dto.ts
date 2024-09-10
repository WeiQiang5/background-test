import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginDto } from 'src/common/dto';

export class ListMeetingDto extends PaginDto {
  @ApiProperty({
    type: String,
    description: '名称',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
  @ApiProperty({
    type: Number,
    description: '容量',
    required: false,
  })
  @IsString()
  @IsOptional()
  capacity?: number;
  @ApiProperty({
    type: String,
    description: '设备',
    required: false,
  })
  @IsString()
  @IsOptional()
  equipment?: string;
}
