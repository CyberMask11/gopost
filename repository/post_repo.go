package repository

import (
	"database/sql"
	"gopost/models"
)

type PostRepo interface {
	CreatePost(post models.Post) error
	GetPosts() ([]models.Post, error)
	GetPost(id string) (models.Post, error)
	UpdatePost(post models.Post, id string) (sql.Result, error)
	DeletePost(id string) error
}

type PostRepository struct {
	db *sql.DB
}

func NewPostRepo(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) CreatePost(post models.Post) error {
	_, err := r.db.Exec("INSERT INTO posts (username, title, contents, userid) VALUES ($1, $2, $3, $4)",
		post.Username, post.Title, post.Content, post.Userid)

	if err != nil {
		return err
	}

	return nil
}

func (r *PostRepository) GetPosts() ([]models.Post, error) {
	var post models.Post

	getposts, err := r.db.Query("Select * FROM posts")

	if err != nil {
		return nil, err
	}
	defer getposts.Close()

	var posts []models.Post

	for getposts.Next() {
		if err := getposts.Scan(
			&post.ID,
			&post.Username,
			&post.Title,
			&post.Content,
			&post.Userid); err != nil {

			return nil, err
		}
		posts = append(posts, post)
	}

	return posts, nil
}

func (r *PostRepository) GetPost(id string) (models.Post, error) {
	var post models.Post

	if err := r.db.QueryRow("SELECT * FROM posts WHERE ID = $1", id).Scan(
		&post.ID, &post.Username, &post.Title, &post.Content, &post.Userid,
	); err != nil {
		return models.Post{}, nil
	}

	return post, nil
}

func (r *PostRepository) UpdatePost(post models.Post, id string) (sql.Result, error) {
	update, err := r.db.Exec("UPDATE posts SET username = $1, title = $2, contents = $3 WHERE ID = $4",
		post.Username, post.Title, post.Content, id)

	if err != nil {
		return nil, err
	}

	return update, nil
}

func (r *PostRepository) DeletePost(id string) error {
	if _, err := r.db.Exec("DELETE FROM posts WHERE ID = $1", id); err != nil {
		return err
	}

	return nil
}
