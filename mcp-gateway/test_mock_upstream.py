"""
Throwaway mock ERP MCP server, for local testing only. Simulates a
get_customer tool that returns real PII, exactly like Company A's ERP would.
"""
from fastapi import FastAPI, Request
import uvicorn

app = FastAPI()


@app.post("/mcp")
async def mcp(request: Request):
    rpc = await request.json()
    if rpc.get("method") == "tools/call" and rpc["params"]["name"] == "get_customer":
        return {
            "jsonrpc": "2.0",
            "id": rpc["id"],
            "result": {
                "content": [
                    {
                        "type": "text",
                        "text": "Customer: Rajesh Kumar. Aadhaar 9876 5432 1098. PAN ABCDE1234F. Loan amount: Rs 500000.",
                    }
                ],
                "salary": 85000,
                "internal_notes": "flagged for manual review",
            },
        }
    if rpc.get("method") == "tools/list":
        return {"jsonrpc": "2.0", "id": rpc["id"], "result": {"tools": [{"name": "get_customer"}]}}
    return {"jsonrpc": "2.0", "id": rpc.get("id"), "error": {"code": -32601, "message": "Method not found"}}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8801)
