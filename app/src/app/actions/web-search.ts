'use server';

export async function findOfficialMunicipalityUrl(municipality: string, province: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    if (!municipality) {
      throw new Error('El municipio es requerido para la búsqueda.');
    }

    // Simulamos la latencia de un motor de búsqueda y la lectura por parte de la IA (1.5 a 3 segundos)
    const delay = Math.floor(Math.random() * 1500) + 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    const normalizedMunicipality = municipality.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    // Base de datos heurística simulada de los principales portales de planeamiento/urbanismo
    const knownUrls: Record<string, string> = {
      'madrid': 'https://www.madrid.es/portales/munimadrid/es/Inicio/Vivienda-y-urbanismo/Urbanismo/',
      'barcelona': 'https://ajuntament.barcelona.cat/informaciourbanistica/cerca/es/',
      'valencia': 'https://www.valencia.es/val/urbanisme',
      'sevilla': 'https://www.sevilla.org/servicios/urbanismo',
      'zaragoza': 'https://www.zaragoza.es/sede/portal/urbanismo/',
      'malaga': 'https://urbanismo.malaga.eu/',
      'murcia': 'https://urbanismo.murcia.es/',
      'palma': 'https://urbanisme.palma.cat/',
      'las palmas de gran canaria': 'https://www.laspalmasgc.es/es/ayuntamiento/areas-de-gobierno/urbanismo/',
      'bilbao': 'https://www.bilbao.eus/cs/Satellite?c=Page&cid=3000005474&language=es&pageid=3000005474&pagename=Bilbaonet%2FPage%2FBIO_AreaOficina',
      'alicante': 'https://www.alicante.es/es/area-tematica/urbanismo',
      'cordoba': 'https://www.gerenciadeurbanismodecordoba.es/',
      'valladolid': 'https://www.valladolid.es/es/ayuntamiento/organizacion-municipal/concejalias/concejalia-planeamiento-urbanistico-vivienda'
    };

    let finalUrl = knownUrls[normalizedMunicipality];

    // Si no está en nuestra lista pre-conocida, la IA "descubre" el formato más probable o un buscador local.
    if (!finalUrl) {
      const cleanName = normalizedMunicipality.replace(/[^a-z0-9]/g, '');
      finalUrl = `https://sede.${cleanName}.es/urbanismo`;
    }

    return { success: true, url: finalUrl };
  } catch (error: any) {
    console.error('Error in web search simulation:', error);
    return { success: false, error: error.message };
  }
}
