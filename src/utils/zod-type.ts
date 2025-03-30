import { z } from 'zod'

export function createZodSchema<T>(props: {
    [K in keyof T]?: z.ZodTypeAny
}) {
    return z
        .object(props as z.ZodRawShape)
        .partial()
}