// Dữ liệu khởi tạo được lưu thật vào AsyncStorage ở lần mở đầu tiên.
// URL ảnh thật; giao diện có trạng thái dự phòng khi ảnh mạng chưa được lưu đệm.
export function seedData() {
  const DishCategory = [
    { Id: 'cat-main', Name: 'Main dishes', Description: 'Rice, noodles and warm meals' },
    { Id: 'cat-drink', Name: 'Drinks', Description: 'Coffee, tea and juice' },
    { Id: 'cat-dessert', Name: 'Desserts', Description: 'Sweet treats and fruit' },
  ];
  const examples = [
    ['dish-rice', 'Chicken rice', 45000, 12, true, 'cat-main', 'photo-1546069901-ba9599a7e63c'],
    ['dish-noodle', 'Beef noodles', 55000, 20, true, 'cat-main', 'photo-1569718212165-3a8278d5f624'],
    ['dish-coffee', 'Iced coffee', 30000, 5, true, 'cat-drink', 'photo-1509042239860-f550ce710b93'],
    ['dish-tea', 'Peach tea', 35000, 8, false, 'cat-drink', 'photo-1556679343-c7306c1976bc'],
    ['dish-cake', 'Chocolate cake', 40000, 15, true, 'cat-dessert', 'photo-1578985545062-69928b1d9587'],
  ];
  const Dish = examples.map(([Id, Name, Price, PreparationTime, IsAvailable, DishCategoryId, image]) => ({
    Id, Name, Price, PreparationTime, IsAvailable, DishCategoryId,
    Description: `${Name}, prepared fresh with carefully selected ingredients.`,
    DishImage: [
      { ImageUrl: `https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=80`, IsThumbnail: true },
      { ImageUrl: `https://images.unsplash.com/${image}?auto=format&fit=crop&w=700&q=80`, IsThumbnail: false },
    ],
  }));
  return { DishCategory, Dish };
}
