import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "../../api/product";

export function useAllProducts() {
    return useQuery({
        queryKey: ["products"],
        queryFn: getAllProducts,
    });
}
