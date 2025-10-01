export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  created_at: string;
  updated_at: string;
  fork: boolean;
  html_url: string;
  topics: string[];
  default_branch: string;
}