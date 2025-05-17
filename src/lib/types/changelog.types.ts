export type ChangelogEntry = {
  id: string;
  created_at: string;
  published_date: string; // Assuming YYYY-MM-DD format
  image_url: string | null;
  heading_en: string;
  paragraph_en: string;
  heading_ar: string;
  paragraph_ar: string;
}; 