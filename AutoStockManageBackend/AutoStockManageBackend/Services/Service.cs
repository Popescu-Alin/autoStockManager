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

        public T? GetByIdAsync(int id) => _repository.GetByIdAsync(id);

        public IQueryable<T> GetAllAsync(Expression<Func<T, bool>>? filter) => _repository.GetAllAsync(filter);

        public T CreateAsync(T entity) => _repository.AddAsync(entity);

        public T UpdateAsync(T entity) => _repository.UpdateAsync(entity);

        public bool DeleteAsync(int id) => _repository.DeleteAsync(id);

        public T? FindByCondition(Expression<Func<T, bool>> filter) => _repository.FindByCondition(filter);
    }

}
