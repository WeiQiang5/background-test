import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    type: String,
    description: '用户名',
    required: true,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;
  @ApiProperty({
    type: String,
    description: '密码',
    required: true,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码不能少于6位' })
  password: string;
  email: string;
}
