"use client";

import { useEffect, useRef, useState } from "react";
import {
  ColorSwatch,
  Group,
  NumberInput,
  Button,
  Paper,
  NumberInputHandlers,
} from "@mantine/core";
import { PlusIcon, MinusIcon } from "@heroicons/react/20/solid";
import { ProductData } from "@/app/products/[handle]/page";
import Image from "next/image";
import { fetchShopifyData } from "@/utils/shopify";

interface CreateCartId {
  cartCreate: {
    cart: {
      id: string
    }
  }
}

interface ColorMap {
  [key: string]: string
}

const colorMap: ColorMap = {
  "White": "white",
  "Rose CZ": "#B76E79"
}

const Product = ({
  colors,
  sizes,
  data,
}: {
  colors: Set<string>;
  sizes: Set<string>;
  data: ProductData;
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const handlersRef = useRef<NumberInputHandlers>(null);
  // todo Keep track of qty

  useEffect(() => {
    if (data.variants.nodes.length === 1) {
      const singleVariant = data.variants.nodes[0];
      setSelectedVariantId(singleVariant.id);
      const colorOption = singleVariant.selectedOptions.find(
        (opt) => opt.name === "Color"
      );
      const sizeOption = singleVariant.selectedOptions.find(
        (opt) => opt.name === "Size"
      );

      if (colorOption) setSelectedColor(colorOption.value);
      if (sizeOption) setSelectedSize(sizeOption.value);
    } else if (data.variants.nodes.length > 1) {
      const firstVariant = data.variants.nodes[0];
      const colorOption = firstVariant.selectedOptions.find(
        (opt) => opt.name === "Color"
      );
      const sizeOption = firstVariant.selectedOptions.find(
        (opt) => opt.name === "Size"
      );

      if (colorOption) setSelectedColor(colorOption.value);
      if (sizeOption) setSelectedSize(sizeOption.value);
    }
  }, [data.variants.nodes]);

  // This keeps track of the Size and Color. Uses find() to find the product variant id
  useEffect(() => {
    const filteredVariant = data.variants.nodes.find(
      (variant) =>
        variant.selectedOptions.some(
          (opt) => opt.name === "Color" && opt.value === selectedColor
        ) &&
        variant.selectedOptions.some(
          (opt) => opt.name === "Size" && opt.value === selectedSize
        )
    );

    if (filteredVariant) {
      setSelectedVariantId(filteredVariant.id)
    }

  }, [selectedSize, selectedColor, data.variants.nodes]);

  const createCartIdMutation = `mutation {
    cartCreate {
      cart {
        id
      }
    }
  }`

  const handleAddToCart =  async () => {
    const cartData: CreateCartId = await fetchShopifyData(createCartIdMutation);
    const cartId = cartData.cartCreate.cart.id

    if (!localStorage.getItem("cartId")) {
      localStorage.setItem("cartId", cartId)
    }

    // todo get item clicked, qty, variant, and what not and add to cart data
    console.log("cartId already exists")
    console.log(data);
    console.log(selectedColor, selectedSize);
    console.log(selectedVariantId);
  }

  return (
    <div>
      {selectedVariantId ? (
        <div>
          <Image
            src={
              data.variants.nodes.find(
                (variant) => variant.id === selectedVariantId
              )?.image.url ?? ""
            }
            alt={
              data.variants.nodes.find(
                (variant) => variant.id === selectedVariantId
              )?.image.altText ?? data.title
            }
            width={1000}
            height={1000}
            priority
          />
          <h1>{data.title}</h1>
          <p>
            Price: $
            {
              data.variants.nodes.find(
                (variant) => variant.id === selectedVariantId
              )?.price.amount
            }
          </p>
        </div>
      ) : (
        <div>
          <Image
            src={data.variants.nodes[0].image.url}
            alt={data.variants.nodes[0].image.altText || data.title}
            width={1000}
            height={1000}
            priority
          />
          <h1>{data.title}</h1>
          <p>Price: ${data.variants.nodes[0].price.amount}</p>
        </div>
      )}

      {data.variants.nodes.length > 1 && <p>Color:</p>}

      <Group>
        {Array.from(colors).map((color, index) => (
          <ColorSwatch
            key={color + index}
            color={colorMap[color]}
            withShadow={selectedColor === color}
            onClick={() => setSelectedColor(color)}
            style={{
              cursor: "pointer",
              border: selectedColor === color ? "2px solid black" : "none",
            }}
          />
        ))}
      </Group>

      <Paper p="md" withBorder>
        <Group>
          <Button
            variant={"transparent"}
            onClick={() => handlersRef.current?.decrement()}
            disabled={
              data.variants.nodes.find(
                (variant) => variant.id === selectedVariantId
              )?.quantityAvailable === 0
            }
          >
            <MinusIcon className="size-6" />
          </Button>

          <NumberInput
            handlersRef={handlersRef}
            min={1}
            max={
              data.variants.nodes.find(
                (variant) => variant.id === selectedVariantId
              )?.quantityAvailable
            }
            defaultValue={1}
            hideControls
            disabled={
              data.variants.nodes.find(
                (variant) => variant.id === selectedVariantId
              )?.quantityAvailable === 0
            }
          />
          <Button
            variant={"transparent"}
            onClick={() => handlersRef.current?.increment()}
            disabled={
              data.variants.nodes.find(
                (variant) => variant.id === selectedVariantId
              )?.quantityAvailable === 0
            }
          >
            <PlusIcon className="size-6" />
          </Button>
        </Group>
      </Paper>

      {data.variants.nodes.length > 1 && (
        <>
          <p>Sizes:</p>
          <Paper p="md" withBorder>
            <Group>
              {Array.from(sizes)
                .sort((a, b) => a.localeCompare(b))
                .map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "filled" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    disabled={
                      !data.variants.nodes.some(
                        (variant) =>
                          variant.selectedOptions.some(
                            (opt) =>
                              opt.name === "Color" &&
                              opt.value === selectedColor
                          ) &&
                          variant.selectedOptions.some(
                            (opt) => opt.name === "Size" && opt.value === size
                          ) &&
                          variant.quantityAvailable > 0
                      )
                    }
                  >
                    {size}
                  </Button>
                ))}
            </Group>
          </Paper>
        </>
      )}

      {selectedVariantId ? (
        <div>
          <p>
            {(data.variants.nodes.find(
              (variant) => variant.id === selectedVariantId
            )?.quantityAvailable ?? 0) > 0
              ? "In Stock"
              : "Sold Out"}
          </p>
          <Button
            disabled={
              data.variants.nodes.find(
                (variant) => variant.id === selectedVariantId
              )?.quantityAvailable === 0
            }
            onClick={() => handleAddToCart()}
          >
            Add to Cart
          </Button>
        </div>
      ) : (
        <div>
          <p>
            {data.variants.nodes[0].quantityAvailable > 0
              ? "In Stock"
              : "Sold Out"}
          </p>
          <Button
            disabled={data.variants.nodes[0].quantityAvailable === 0}
            onClick={() => handleAddToCart()}
          >
            Add to Cart
          </Button>
        </div>
      )}
    </div>
  );
};

export default Product;
