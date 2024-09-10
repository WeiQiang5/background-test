import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional } from 'class-validator';
import { PaginDto } from 'src/common/dto';

export class ListUserDto extends PaginDto {
  @ApiProperty({
    type: String,
    description: '用户名',
    required: false,
  })
  @IsOptional()
  username?: string;
  @ApiProperty({
    type: String,
    description: '签名',
    required: false,
  })
  @IsOptional()
  nickName?: string;
  @ApiProperty({
    type: String,
    description: '邮箱',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  @Transform(({ value }) => (value === '' ? undefined : value))
  email?: string;
}
