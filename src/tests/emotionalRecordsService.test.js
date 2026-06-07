const { listEmotionalRecordsByUser, createEmotionalRecord } = require("../services/emotionalRecordsService");
const { pool } = require("../services/postgresClient");

describe("Pruebas Unitarias - emotionalRecordsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("listEmotionalRecordsByUser debe ejecutar la consulta y retornar filas", async () => {
    const mockRows = [{ id: 1 }];
    jest.spyOn(pool, "query").mockResolvedValue({ rows: mockRows });

    const result = await listEmotionalRecordsByUser("user123", null, null);

    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual(mockRows);
  });

  test("createEmotionalRecord debe insertar y retornar el registro", async () => {
    const mockRow = { id: 5 };
    jest.spyOn(pool, "query").mockResolvedValue({ rows: [mockRow] });

    const result = await createEmotionalRecord("user123", 2);

    expect(pool.query).toHaveBeenCalled();
    expect(result).toEqual(mockRow);
  });
});