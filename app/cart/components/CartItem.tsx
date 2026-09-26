import Image from "next/image";
import { Plus, Minus, Trash2 } from "lucide-react";
import type { Product } from "../../components/products/types";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
interface Props { product: Product; qty: number; onUpdateQty: (id: string, qty: number) => void; onRemove: (id: string) => void; }
export default function CartItem({product,qty,onUpdateQty,onRemove}:Props){
  const price = product.salePrice ?? product.originalPrice ?? product.price;
  const raw = product.images?.[0] || product.image;
  const image = raw ? raw.startsWith("http") ? raw : `${API}${raw.startsWith("/") ? raw : `/${raw}`}` : undefined;
  return <article className="basket-item"><div className="basket-item-image">{image && <Image src={image} alt={product.name} fill sizes="100px" className="object-contain p-2"/>}</div><div className="basket-item-info"><h3><a href={`/product/${product._id}`}>{product.name}</a></h3><div className="basket-item-specs">{product.storage && <span>{product.storage}</span>}{product.color && <span>{product.color}</span>}</div><div className="basket-item-bottom"><strong>{(price*qty).toLocaleString("en-US")} <small>ر.س</small></strong><div className="basket-qty"><button aria-label={`تقليل كمية ${product.name}`} disabled={qty<=1} onClick={()=>onUpdateQty(product._id,qty-1)}><Minus size={13}/></button><output>{qty}</output><button aria-label={`زيادة كمية ${product.name}`} onClick={()=>onUpdateQty(product._id,qty+1)}><Plus size={13}/></button></div></div></div><button className="basket-remove" aria-label={`حذف ${product.name}`} onClick={()=>onRemove(product._id)}><Trash2 size={16}/></button></article>;
}
