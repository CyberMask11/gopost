package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/time/rate"
)

func AuthJwt() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Header Missing.",
			})
			c.Abort()
			return
		}

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Unauthorized missing bearer.",
			})
			c.Abort()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
			return []byte(os.Getenv("SECRET")), nil
		})

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid Token.",
			})
			c.Abort()
			return
		}

		if !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid Token.",
			})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(401, gin.H{"error": "Invalid claims."})
			c.Abort()
			return
		}

		role, ok := claims["role"].(string)
		if !ok {
			c.JSON(404, gin.H{"error": "Role missing."})
			c.Abort()
			return
		}

		id, ok := claims["id"].(string)
		if !ok {
			c.JSON(404, gin.H{"error": "Missing id."})
			c.Abort()
			return
		}

		parsedId, _ := uuid.Parse(id)

		username, ok := claims["username"].(string)
		if !ok {
			c.JSON(404, gin.H{"error": "Missing Username."})
			c.Abort()
			return
		}

		c.Set("userid", parsedId)
		c.Set("username", username)
		c.Set("role", role)
		c.Next()
	}
}

func RateLimiter() gin.HandlerFunc {
	ratelimiter := rate.NewLimiter(rate.Limit(10), 10)

	return func(c *gin.Context) {
		if !ratelimiter.Allow() {
			c.JSON(429, gin.H{"error": "Too many request."})
			c.Abort()
			return
		}
		c.Next()
	}
}
