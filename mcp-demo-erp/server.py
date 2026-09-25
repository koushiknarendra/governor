"""
Demo ERP MCP server — stands in for "Company A's ERP" for demos and
outreach. Not a real integration; returns realistic-looking Indian PII so
the MCP Gateway's redaction is visible end-to-end when pointed at this.
"""
from fastapi import FastAPI, Request

app = FastAPI(
    title="Demo ERP (MCP)",
    description="Fake ERP MCP server for demoing Governor's MCP Gateway — not a real integration.",
)

_TOOLS = [
    {"name": "get_customer", "description": "Look up a customer's loan application by ID."},
    {"name": "list_invoices", "description": "List recent invoices for a customer."},
]

_CUSTOMERS = {
    "C-5821": {
        "text": "Customer: Rajesh Kumar. Aadhaar 9876 5432 1098. PAN ABCDE1234F. "
                "Bank account 001234567890. Loan amount: Rs 500000.",
        "salary": 85000,
        "internal_notes": "flagged for manual review",
    },
    "C-9012": {
        "text": "Customer: Priya Sharma. Aadhaar 1234 5678 9012. PAN XYZAB5678C. "
                "UPI priya@okhdfcbank. Loan amount: Rs 250000.",
        "salary": 62000,
        "internal_notes": "first-time applicant",
    },
}


@app.post("/mcp")
async def mcp(request: Request):
    rpc = await request.json()
    method = rpc.get("method")
    rpc_id = rpc.get("id")

    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": rpc_id, "result": {"tools": _TOOLS}}

    if method == "tools/call":
        params = rpc.get("params", {})
        name = params.get("name")
        args = params.get("arguments", {})

        if name == "get_customer":
            customer = _CUSTOMERS.get(args.get("customer_id"), _CUSTOMERS["C-5821"])
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "result": {
                    "content": [{"type": "text", "text": customer["text"]}],
                    "salary": customer["salary"],
                    "internal_notes": customer["internal_notes"],
                },
            }

        if name == "list_invoices":
            return {
                "jsonrpc": "2.0",
                "id": rpc_id,
                "result": {
                    "content": [{
                        "type": "text",
                        "text": "Invoice INV-2201: Rs 12,000, GSTIN 27AAAPL1234C1ZV. "
                                "Invoice INV-2202: Rs 8,500, GSTIN 27AAAPL1234C1ZV.",
                    }]
                },
            }

    return {"jsonrpc": "2.0", "id": rpc_id, "error": {"code": -32601, "message": "Method not found"}}


@app.get("/health")
def health():
    return {"status": "ok", "note": "demo ERP — not a real integration"}
