import { removeTokenCookie } from '@/lib/auth';
import { success } from '@/lib/api-response';

export async function POST() {
  await removeTokenCookie();
  return success(null, '已退出登录');
}
