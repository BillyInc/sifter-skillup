const mockRequest = jest.fn();

jest.mock("./api", () => ({ API_READ_TIMEOUT_MS: 1000, request: (...a: unknown[]) => mockRequest(...a) }));
jest.mock("./careerCache", () => ({
  getCached: jest.fn(async () => null),
  getCachedStale: jest.fn(async () => null),
  setCached: jest.fn(async () => undefined),
  queueWrite: jest.fn(),
  cancelQueuedSave: jest.fn(),
  flushQueue: jest.fn(),
}));

import { careerData } from "./careerData";

describe("careerData grades", () => {
  beforeEach(() => {
    mockRequest.mockReset();
    mockRequest.mockResolvedValue({ status: "real", data: [], meta: {} });
  });

  it("uses the unchanged GET variant when there are no grades", async () => {
    await careerData.getProgrammesBySubjects(["English Language"], "science", {
      examType: "olevel", olevelSubjects: ["Mathematics"], olevelGrades: {},
    });
    const [url, init] = mockRequest.mock.calls[0];
    expect(url).toMatch(/^\/api\/student\/programmes\/by-subjects\?/);
    expect(url).toContain("olevel_subjects=Mathematics");
    expect(init).toBeUndefined();
  });

  it("uses the POST variant with grades in the body, never the URL", async () => {
    await careerData.getProgrammesBySubjects(["English Language"], "science", {
      examType: "combined", olevelSubjects: ["Mathematics", "Biology"], olevelGrades: { Mathematics: "C4" },
    });
    const [url, init] = mockRequest.mock.calls[0];
    expect(url).toBe("/api/student/programmes/by-subjects");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({
      subjects: "English Language", olevel_subjects: "Mathematics,Biology", exam_type: "combined",
      olevel_grades: { Mathematics: "C4" },
    });
    expect(url).not.toContain("C4");
  });

  it("does not share a cache entry between graded and ungraded matches", async () => {
    const opts = { examType: "olevel" as const, olevelSubjects: ["Mathematics"] };
    await careerData.getProgrammesBySubjects(["English Language"], undefined, opts);
    await careerData.getProgrammesBySubjects(["English Language"], undefined, { ...opts, olevelGrades: { Mathematics: "F9" } });
    await careerData.getProgrammesBySubjects(["English Language"], undefined, { ...opts, olevelGrades: { Mathematics: "A1" } });
    expect(mockRequest).toHaveBeenCalledTimes(3);
  });

  it("strips grades from the starting-point payload and saves them as a new grade-set version", async () => {
    await careerData.saveStartingPoint({ userType: "jamb", olevelSubjects: ["Mathematics"], olevelGrades: { Mathematics: "C4" }, olevelExamBody: "neco" } as never);
    const sp = JSON.parse(mockRequest.mock.calls[0][1].body);
    expect(sp.olevelGrades).toBeUndefined();
    expect(sp.olevelExamBody).toBeUndefined();
    expect(sp.olevelSubjects).toEqual(["Mathematics"]);
    await careerData.saveSubjectGrades("neco", { Mathematics: "C4" });
    const [url, init] = mockRequest.mock.calls[1];
    expect(url).toBe("/api/student/subject-grades");
    expect(JSON.parse(init.body)).toEqual({ exam_body: "neco", grades: { Mathematics: "C4" } });
  });

  it("returns an unsupported state instead of throwing when the grade store request fails", async () => {
    mockRequest.mockRejectedValue(new Error("boom"));
    expect((await careerData.getSubjectGrades()).status).toBe("coming_soon");
    expect((await careerData.saveSubjectGrades("waec", {})).status).toBe("coming_soon");
  });
});
