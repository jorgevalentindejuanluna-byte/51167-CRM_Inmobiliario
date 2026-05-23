export interface CadastralData {
  reference: string;
  location: string;
  use: string;
  surface: string;
  construction_year: string;
}

export interface UrbanRegulation {
  status: 'found' | 'not_found' | 'partial';
  title: string;
  source_url: string;
  summary: string;
  limitations: string;
}

export interface IbiEstimation {
  status: 'estimated' | 'missing_cadastral_value' | 'missing_rates';
  fiscal_year: string;
  urban_rate: number | null;
  rustic_rate: number | null;
  cadastral_value_used: number | null;
  estimated_amount: number | null;
  source_url: string;
}

export interface AiPropertyQuery {
  id: string;
  property_id?: string;
  user_id: string;
  agency_id: string;
  query_type: 'urbanismo' | 'ibi' | 'catastro' | 'completo';
  province?: string;
  municipality?: string;
  address?: string;
  cadastral_reference?: string;
  input_payload?: any;
  result_payload?: {
    summary: string;
    cadastral_data: CadastralData;
    urban_regulation?: UrbanRegulation;
    ibi?: IbiEstimation;
    sources: string[];
    confidence_score: number;
    legal_warning: string;
    recommendations: string[];
  };
  sources?: any;
  confidence_score?: number;
  status: 'pending' | 'completed' | 'partial' | 'failed' | 'review_required';
  created_at: string;
  updated_at: string;
}

export interface CadastralCache {
  id: string;
  cadastral_reference: string;
  province?: string;
  municipality?: string;
  raw_response?: string;
  normalized_data?: CadastralData;
  source_url?: string;
  fetched_at: string;
  expires_at?: string;
}
