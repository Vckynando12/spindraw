import { toPng } from 'html-to-image';
import { Category, Team, Participant, PrizeDraw } from '../types';

/**
 * Export Tim per Kategori ke CSV
 * Format: Kategori, Tim, Nomor Urut, Nama Peserta
 */
export function exportTeamsToCSV(categories: Category[], currentCategoryOnly?: Category) {
  const targets = currentCategoryOnly ? [currentCategoryOnly] : categories;
  const rows: string[][] = [
    ['Kategori', 'Nama Tim', 'Nomor Slot', 'Nama Peserta']
  ];

  targets.forEach((cat) => {
    cat.teams.forEach((team) => {
      team.members.forEach((member, idx) => {
        rows.push([
          `"${cat.label.replace(/"/g, '""')}"`,
          `"${team.name.replace(/"/g, '""')}"`,
          `${idx + 1}`,
          `"${member.name.replace(/"/g, '""')}"`
        ]);
      });
      // Slot yang masih kosong
      for (let i = team.members.length; i < team.quota; i++) {
        rows.push([
          `"${cat.label.replace(/"/g, '""')}"`,
          `"${team.name.replace(/"/g, '""')}"`,
          `${i + 1}`,
          '"(Belum Terisi)"'
        ]);
      }
    });
  });

  const csvContent = '\uFEFF' + rows.map((r) => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Hasil-Tim-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Riwayat Pemenang Hadiah ke CSV
 */
export function exportPrizeWinnersToCSV(history: PrizeDraw[]) {
  const rows: string[][] = [
    ['Waktu Undian', 'Nama Hadiah', 'Nomor Juara', 'Nama Pemenang']
  ];

  history.forEach((draw) => {
    const time = new Date(draw.drawnAt).toLocaleString('id-ID');
    const prize = draw.prizeName || 'Hadiah Doorprize';
    draw.winners.forEach((w, idx) => {
      rows.push([
        `"${time}"`,
        `"${prize.replace(/"/g, '""')}"`,
        `${idx + 1}`,
        `"${w.name.replace(/"/g, '""')}"`
      ]);
    });
  });

  const csvContent = '\uFEFF' + rows.map((r) => r.join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Hasil-Pemenang-Hadiah-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download elemen HTML sebagai gambar PNG
 */
export async function exportElementAsPng(elementId: string, filename: string): Promise<boolean> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element #${elementId} not found`);
    return false;
  }

  try {
    const dataUrl = await toPng(node, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#071E2F'
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (err) {
    console.error('Failed to export element to PNG:', err);
    return false;
  }
}
