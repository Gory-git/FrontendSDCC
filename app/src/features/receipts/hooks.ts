import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addReceipt,
    deleteReceipt,
    getAllReceipts,
    getReceiptPdfUrl,
    getReceiptsByCode,
    getReceiptsByUserEmail,
    uploadReceiptPdf,
} from "../../api/receipt";

export function useReceipts(sortByDate: boolean, enabled = true) {
    return useQuery({
        queryKey: ["receipts", sortByDate],
        queryFn: () => getAllReceipts(sortByDate),
        enabled,
    });
}

export function useReceiptsByUserEmail(email: string, threshold: number, enabled = true) {
    return useQuery({
        queryKey: ["receipts", "by-user", email, threshold],
        queryFn: () => getReceiptsByUserEmail(email, threshold),
        enabled: enabled && !!email,
    });
}

export function useReceiptsByCode(code: string, threshold: number, enabled = true) {
    return useQuery({
        queryKey: ["receipts", "by-code", code, threshold],
        queryFn: () => getReceiptsByCode(code, threshold),
        enabled: enabled && !!code,
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

export function useDeleteReceipt() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteReceipt,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
        },
    });
}
