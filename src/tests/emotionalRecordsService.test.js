const { 
  listEmotionalRecordsByUser, 
  createEmotionalRecord, 
  getMonthlySummaryByUser, 
  getMonthlyCognitiveLoadByUser 
} = require("../services/emotionalRecordsService");
const { pool } = require("../services/postgresClient");

describe("Pruebas Unitarias - emotionalRecordsService (Actualizado)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listEmotionalRecordsByUser y createEmotionalRecord basicos", async () => {
    jest.spyOn(pool, "query").mockResolvedValue({ rows: [] });
    await listEmotionalRecordsByUser("u1", null, null);
    
    jest.spyOn(pool, "query").mockResolvedValue({ rows: [{ id: 1 }] });
    await createEmotionalRecord("u1", 2);
    expect(pool.query).toHaveBeenCalled();
  });

  describe("monthNameToNumber Internals via Public Methods", () => {
    test("Debe procesar nombres de meses de texto (ej. enero, setiembre) o numeros en texto", async () => {
      jest.spyOn(pool, "query").mockResolvedValue({ rows: [] });

      // Prueba con texto de mes
      await getMonthlySummaryByUser({ userId: "u1", month: "enero", year: "2026" });
      // Prueba con mes alternativo
      await getMonthlySummaryByUser({ userId: "u1", month: "setiembre", year: "2026" });
      // Prueba con numero de mes en string
      await getMonthlySummaryByUser({ userId: "u1", month: "05", year: "2026" });

      expect(pool.query).toHaveBeenCalled();
    });

    test("Debe lanzar un error si el mes o el anio no se pueden parsear", async () => {
      await expect(
        getMonthlySummaryByUser({ userId: "u1", month: "mes-invalido", year: "2026" })
      ).rejects.toThrow("Mes o anio invalido");
    });
  });

  test("getMonthlyCognitiveLoadByUser retorna la primera fila", async () => {
    const mockLoad = { month: "2026-01", average_cognitive_load: 50 };
    jest.spyOn(pool, "query").mockResolvedValue({ rows: [mockLoad] });

    const result = await getMonthlyCognitiveLoadByUser({ userId: "u1", month: "1", year: "2026" });
    expect(result).toEqual(mockLoad);
  });
});