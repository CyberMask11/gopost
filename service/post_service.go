package service

import (
	"database/sql"
	"errors"
	"gopost/models"
	"gopost/repository"

	"github.com/google/uuid"
)

type PostService struct {
	repo repository.PostRepo
}

func NewPostService(repo repository.PostRepo) *PostService {
	return &PostService{repo: repo}
}

func (r *PostService) CreatePost(post models.Post, username string, userid uuid.UUID) error {
	post.Username = username
	post.Userid = userid

	if err := r.repo.CreatePost(post); err != nil {
		return err
	}

	return nil
}

func (r *PostService) GetPosts() ([]models.Post, error) {
	posts, err := r.repo.GetPosts()

	if err != nil {
		return nil, err
	}

	return posts, nil
}

func (r *PostService) GetPost(id string) (models.Post, error) {
	post, err := r.repo.GetPost(id)

	if err != nil {
		return models.Post{}, err
	}

	return post, nil
}

func (r *PostService) UpdatePost(post models.Post, id string, userid uuid.UUID, role string) (sql.Result, error) {
	getpost, err := r.repo.GetPost(id)
	if err != nil {
		return nil, err
	}

	if userid != getpost.Userid {
		if role != "admin" {
			return nil, errors.New("User Unauthorized.")
		}
	}

	post.Username = getpost.Username
	post.Userid = getpost.Userid

	update, err := r.repo.UpdatePost(post, id)

	if err != nil {
		return nil, err
	}

	return update, nil
}

func (r *PostService) DeletePost(id string, userid uuid.UUID, role string) error {
	getpost, err := r.repo.GetPost(id)
	if err != nil {
		return err
	}

	if userid != getpost.Userid {
		if role != "admin" {
			return errors.New("User Unauthorized.")
		}
	}

	if err := r.repo.DeletePost(id); err != nil {
		return err
	}

	return nil
}
