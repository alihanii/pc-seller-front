import { Heart } from 'lucide-react'
import { Link } from 'react-router'

import { ProductGrid } from '@/components/product/product-grid'
import { buttonVariants } from '@/components/ui/button-variants'
import { EmptyState } from '@/components/ui/misc'
import { useWishlist } from '@/lib/queries'

export function WishlistPage() {
  const { data, isLoading } = useWishlist()
  return (
    <div>
      <h1 className="mb-5 font-display text-2xl">علاقه‌مندی‌ها</h1>
      {data?.count === 0 ? (
        <EmptyState icon={<Heart />} title="فهرست علاقه‌مندی‌ها خالی است" text="روی قلب هر محصول بزنید تا این‌جا ذخیره شود." action={<Link to="/" className={buttonVariants({})}>گشتن در فروشگاه</Link>} />
      ) : (
        <ProductGrid products={data?.results} loading={isLoading} skeletons={3} className="xl:grid-cols-3" />
      )}
    </div>
  )
}
