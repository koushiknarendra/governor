# Demo ERP (MCP)

A fake ERP MCP server, for demoing the MCP Gateway to prospects. Not a real
integration — returns realistic-looking (but fake) Indian PII so the
Gateway's redaction is visible end-to-end.

Tools: `get_customer` (loan application lookup), `list_invoices`.

Used as `UPSTREAM_MCP_URL` on the `mcp-gateway` project to give it something
real to proxy to for demos.
