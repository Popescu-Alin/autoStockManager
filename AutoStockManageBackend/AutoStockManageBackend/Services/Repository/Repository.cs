using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace AutoStockManageBackend.Services.Repository
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly DbContext _context;
        private readonly DbSet<T> _dbSet;

        public Repository(DbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public  T? GetByIdAsync(int id)
        {
            return _dbSet.Find(id);
        }

        public IQueryable<T> GetAllAsync(Expression<Func<T, bool>>? filter)
        {
            if (filter == null)
            {
                return _dbSet;
            }

            return _dbSet.Where(filter);
        }

        public T AddAsync(T entity)
        {
            _dbSet.Add(entity);
            _context.SaveChanges();
            return entity;
        }

        public T UpdateAsync(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            _context.SaveChanges();
            return entity;
        }

        public bool DeleteAsync(int id)
        {
            var entity =  GetByIdAsync(id);
            if (entity == null)
                return false;

            _dbSet.Remove(entity);
            _context.SaveChanges();
            return true;
        }

        public T? FindByCondition(Expression<Func<T, bool>> filter)
        {
            return _dbSet.Where(filter).FirstOrDefault();
        }
    }

}
