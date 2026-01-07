// 封面图数组 - 统一管理，避免重复定义
export const ANIME_COVERS = [
  "/covers/cimgtwjgu000szrs56jyqr0mg.1200.jpg",
  "/covers/cit9ejr5100c6z35nrc61fd7j.1200.jpg",
  "/covers/ciuur1ym5000cbsjb09bof78s.1200.jpg",
  "/covers/claodyl1v0068m78hgrbs3myq.2160p.jpg",
  "/covers/clba9t5hw007qm78hd3cocnrm.2160p.jpg",
  "/covers/clbihqun3007ym78h7rsq6cda.2160p.jpg",
  "/covers/clc7emns2000w6v8hdu5d1k17.2160p.jpg",
  "/covers/cm7rftv17000hkl8h1gjn9e1v.2160p.jpg",
  "/covers/cm9lnaup3001ikl8h044j19za.2160p.jpg",
  "/covers/cm9za5ads001skl8h125v2zrw.2160p.jpg",
  "/covers/cmabaj7od001xkl8hbdm96tlk.2160p.jpg",
  "/covers/cmatsfxm100041k8h93jd61z7.2160p.jpg",
  "/covers/cmbmb7mr3000f1k8hefiqenx7.2160p.jpg",
  "/covers/cmju6k1jb00168w8hcb4pgdnd.2160p.jpg"
];

export const getAnimeCover = (id: number) => ANIME_COVERS[id % ANIME_COVERS.length];

// 允许上传的图片类型
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

// 最大文件大小 (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 验证文件是否为有效图片
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: `不支持的文件类型: ${file.type}` };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `文件过大，最大支持 5MB` };
  }
  return { valid: true };
}
