import sequelize from '../src/config/database';
import categoryService from '../src/services/category.service';

(async () => {
  try {
    await sequelize.authenticate();
    const categories = await categoryService.getAllCategories('YOUR_MENU_ID_HERE', { page: 1, limit: 5 });
    console.log(categories);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
