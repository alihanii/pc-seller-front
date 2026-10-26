import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import { useToggleWishlist, useWishlist } from '@/lib/queries'
import { useAuth } from '@/stores/auth'

export function useWishlistToggle() {
  const access = useAuth((s) => s.access)
  const { data } = useWishlist()
  const toggle = useToggleWishlist()
  const navigate = useNavigate()
  const liked = new Set(data?.results.map((p) => p.id))
  return {
    isLiked: (id: number) => liked.has(id),
    toggle: (id: number) => {
      if (!access) {
        toast('برای ذخیره‌ی علاقه‌مندی‌ها وارد شوید.')
        navigate('/login')
        return
      }
      toggle.mutate({ productId: id, liked: liked.has(id) }, {
        onSuccess: () => toast.success(liked.has(id) ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد'),
      })
    },
  }
}
