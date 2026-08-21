import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addReceipt,
    getAllReceipts,
    getReceiptPdfUrl,
    uploadReceiptPdf,
} from "../../api/receipt";

export function useReceipts(sortByDate: boolean) {
    return useQuery({
        queryKey: ["receipts", sortByDate],
        queryFn: () => getAllReceipts(sortByDate),
    });
}

export function useAddReceipt() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addReceipt,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
        },
    });
}

export function useUploadReceiptPdf() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: uploadReceiptPdf,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
        },
    });
}

export function useReceiptPdfUrl() {
    return useMutation({
        mutationFn: getReceiptPdfUrl,
    });
}
