export interface ITopImageUrlResolver {
  resolve(path: string | null): string | null;
}
