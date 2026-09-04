from fastapi import FastAPI

app = FastAPI(title="LoopKeeper API")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "LoopKeeper Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
