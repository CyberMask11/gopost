for i in {1..20}; do
    curl  \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"daemon","password":"rogueprinc"}' \
    http://localhost:8080/login
done
