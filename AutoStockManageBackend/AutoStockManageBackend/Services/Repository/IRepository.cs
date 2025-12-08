using System.Linq.Expressions;

namespace AutoStockManageBackend.Services.Repository
{
    public interface IRepository<T> where T : class
    {
        T? GetByIdAsync(int id);
        IQueryable<T> GetAllAsync(Expression<Func<T, bool>>? filter);
        T AddAsync(T entity);
        T UpdateAsync(T entity);
        bool DeleteAsync(int id);
        T? FindByCondition(Expression<Func<T, bool>> filter);
    }

}
