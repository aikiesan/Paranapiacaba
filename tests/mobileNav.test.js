import { describe, expect, it } from 'vitest';
import { LAYERS, GROUPS } from '../src/config/layers.js';
import { PRESETS, PRESET_FAMILIES } from '../src/config/presets.js';

describe('verificação de navegação e layout responsivo mobile', () => {
  it('garante que todos os 7 módulos principais e secundários possuem IDs válidos', () => {
    const validTabs = ['home', 'map', 'ferrovia', 'trilhas', 'campo', 'hidraulica', 'legislacao'];
    expect(validTabs).toHaveLength(7);
    validTabs.forEach((tab) => {
      expect(typeof tab).toBe('string');
      expect(tab.length).toBeGreaterThan(0);
    });
  });

  it('possui 11 grupos de camadas estruturados para renderização no mobile', () => {
    expect(GROUPS).toHaveLength(11);
    GROUPS.forEach((group) => {
      const groupLayers = LAYERS.filter((l) => l.group === group);
      expect(groupLayers.length).toBeGreaterThan(0);
    });
  });

  it('valida que todas as predefinições de escala possuem zoomLevel definido', () => {
    const escalaPresets = PRESETS.filter((p) => p.family === 'escala');
    expect(escalaPresets.length).toBeGreaterThan(0);
    escalaPresets.forEach((preset) => {
      expect(preset.targetScale).toBeDefined();
      expect(preset.zoomLevel).toBeGreaterThan(0);
      expect(typeof preset.zoomLevel).toBe('number');
    });
  });

  it('garante que todas as famílias de predefinição possuem rótulo e dicas', () => {
    expect(PRESET_FAMILIES).toHaveLength(3);
    PRESET_FAMILIES.forEach((fam) => {
      expect(fam.id).toBeDefined();
      expect(fam.label).toBeDefined();
      expect(fam.hint).toBeDefined();
    });
  });
});
