using AutoStockManageBackend.Services.Repository;
using System.Linq.Expressions;

namespace AutoStockManageBackend.Services
{
    public class Service<T>  where T : class
    {
        private readonly IRepository<T> _repository;

        public Service(IRepository<T> repository)
        {
            _repository = repository;
        }

        public T? GetById(int id) => _repository.GetByIdAsync(id);

        public IQueryable<T> GetAll(Expression<Func<T, bool>>? filter = null) => _repository.GetAllAsync(filter);

        public T Create(T entity) => _repository.AddAsync(entity);

        public T Update(T entity) => _repository.UpdateAsync(entity);

        public bool Delete(int id) => _repository.DeleteAsync(id);

        public T? FindByCondition(Expression<Func<T, bool>> filter) => _repository.FindByCondition(filter);
    }

}
