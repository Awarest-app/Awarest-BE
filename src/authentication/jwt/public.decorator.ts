// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

// jwt인증 안하는 guard
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
