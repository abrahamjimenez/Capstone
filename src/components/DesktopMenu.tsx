"use client"

import {useEffect, useState} from "react";
import { Group, Container, Anchor, Menu } from "@mantine/core";
import {MenuInterface} from "@/components/NavigationMenu";
import Link from "next/link";
import {fetchShopifyData} from "@/utils/shopify";
import Image from "next/image";

const DesktopMenu = ({ data }: { data: MenuInterface }) => {
    const [shopName, setShopName] = useState("Jimenez Jewelry");
    const [shopLogo, setShopLogo] = useState<string>("")
    const [opened, setOpened] = useState(false);

    useEffect(() => {
        const query = `{
      shop {
        name
        brand {
            logo {
                image {
                  url(transform: {maxWidth: 100, maxHeight: 100})
                }
            }
        }
      }
    }`;

        const getShopName = async () => {
            try {
                const { shop } = await fetchShopifyData(query);
                setShopName(shop.name);
                setShopLogo(shop.brand.logo.image.url)
            } catch (error) {
                console.error("Failed to fetch shop name:", error);
            }
        };

        getShopName();
    }, []);

    return (
        <Container size="xl" py="md">
            <Group>
                {/* Logo */}
                {shopLogo ? (
                    <Image src={shopLogo} alt={"logo"} width={100} height={100} />
                    ) : (
                    <Link href="/">
                {shopName}
            </Link>
                    )}


                {/* Navigation */}
                <Group>
                    {data.items.map((item) =>
                        item.items.length > 0 ? (
                            <Menu
                                key={item.title}
                                shadow="md"
                                width={200}
                                onOpen={() => setOpened(true)}
                                onClose={() => setOpened(false)}
                            >
                                <Menu.Target>
                                    <Anchor c={"black"}>
                                        {item.title} <span style={{ transform: `rotate(${opened ? 180 : 0}deg)`, display: "inline-block", transition: "transform 0.2s ease" }}>▼</span>
                                    </Anchor>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    {item.items.map((subItem) => (
                                        <Menu.Item key={subItem.title} component="a" href={subItem.url.replace(
                                            process.env.NEXT_PUBLIC_SHOPIFY_URL as string,
                                            "/"
                                        )}>
                                            {subItem.title}
                                        </Menu.Item>
                                    ))}
                                </Menu.Dropdown>
                            </Menu>
                        ) : (
                            <Link key={item.title} href={item.url.replace(
                                process.env.NEXT_PUBLIC_SHOPIFY_URL as string,
                                "/"
                            )}>
                                {item.title}
                            </Link>
                        )
                    )}
                </Group>
            </Group>
        </Container>
    );
};

export default DesktopMenu;
