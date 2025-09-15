import React, { useState, useEffect } from 'react'
import { apiService, Category } from '../api-service'
import { Loader2 } from 'lucide-react'

interface CategorySelectorProps {
  onCategoryChange?: (typeId: number | null, categoryId: number | null) => void
  selectedTypeId?: number | null
  selectedCategoryId?: number | null
  className?: string
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategoryChange,
  selectedTypeId,
  selectedCategoryId,
  className = ''
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<number | null>(selectedTypeId || null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(selectedCategoryId || null)

  // 获取分类数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await apiService.getCategories()
        if (response.code === 0) {
          setCategories(response.data.categories)
        }
      } catch (error) {
        console.error('获取分类失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // 处理一级分类选择
  const handleTypeClick = (typeId: number | null) => {
    setSelectedType(typeId)
    setSelectedCategory(null) // 重置二级分类选择
    
    // 通知父组件
    onCategoryChange?.(typeId, null)
  }

  // 处理二级分类选择
  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    
    // 通知父组件
    onCategoryChange?.(selectedType, categoryId)
  }

  // 获取当前选中类型的子分类
  const getSubCategories = () => {
    if (!selectedType) return []
    const typeCategory = categories.find(cat => cat.type_id === selectedType)
    return typeCategory?.children || []
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-gray-500">加载分类中...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 一级分类按钮组 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">分类</h3>
        <div className="flex flex-wrap gap-1">
          {/* 全部按钮 */}
          <button
            className={`px-2 py-1 rounded text-xs transition-colors ${
              selectedType === null
                ? 'bg-red-100 text-red-600 border border-red-200'
                : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => handleTypeClick(null)}
          >
            全部
          </button>
          
          {/* 只显示一级分类按钮（pid为0的分类） */}
          {categories.filter(category => category.pid === 0).map((category) => (
            <button
              key={category.type_id}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                selectedType === category.type_id
                  ? 'bg-red-100 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => handleTypeClick(category.type_id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 二级分类按钮组 - 当选择一级分类时显示 */}
      {selectedType && getSubCategories().length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">子分类</h3>
          <div className="flex flex-wrap gap-1">
            {/* 全部子分类按钮 */}
            <button
              className={`px-2 py-1 rounded text-xs transition-colors ${
                selectedCategory === null
                  ? 'bg-red-100 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
              onClick={() => handleCategoryClick(null)}
            >
              全部
            </button>
            
            {/* 二级分类按钮 */}
            {getSubCategories().map((subCategory) => (
              <button
                key={subCategory.type_id}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  selectedCategory === subCategory.type_id
                    ? 'bg-red-100 text-red-600 border border-red-200'
                    : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
                onClick={() => handleCategoryClick(subCategory.type_id)}
              >
                {subCategory.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CategorySelector
