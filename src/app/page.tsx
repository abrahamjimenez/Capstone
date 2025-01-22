import { fetchShopifyData } from "@/utils/shopify";
import FeaturedProducts from "@/components/FeaturedProducts";

interface PriceRange {
  maxVariantPrice: {
    amount: string;
  };
  minVariantPrice: {
    amount: string;
  };
}

interface ProductNode {
  id: string;
  title: string;
  images: ProductImages;
  priceRange: PriceRange;
}

interface ProductImagesEdges {
  node: {
    id: string;
    altText: string | null;
    url: string;
  };
}

interface ProductImages {
  edges: ProductImagesEdges[];
}

interface ProductEdge {
  node: ProductNode;
}

export type ProductData = ProductEdge[];

const Home = async () => {
  const featuredProductsQuery = `{
  products(first: 8, sortKey: BEST_SELLING) {
    edges {
      node {
        id
        title
        images(first: 5) {
          edges {
            node {
              id
              url(transform: {maxHeight: 500, maxWidth: 500})
            }
          }
        }
        priceRange {
          maxVariantPrice {
            amount
          }
          minVariantPrice {
            amount
          }
        }
      }
    }
  }
}`;

  let data: ProductData = [];
  try {
    const { products } = await fetchShopifyData(featuredProductsQuery);
    const { edges } = products;
    data = edges;
  } catch (e) {
    console.error("Failed to fetch featured products: ", e);
  }

  return (
    <div>
      <h1>Featured Products</h1>
      <FeaturedProducts data={data} />
    </div>
  );
};

export default Home;
