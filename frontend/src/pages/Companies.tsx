import { useState, useEffect } from 'react';
import { apiClient } from '../services/api-client';
import { Building2, Plus, Edit2, Trash2, MapPin, Mail, Phone, Users, FolderKanban } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

interface Company {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  _count?: {
    projects: number;
    users: number;
  };
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await apiClient.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await apiClient.updateCompany(editingCompany.id, formData);
      } else {
        await apiClient.createCompany(formData);
      }
      setShowModal(false);
      setEditingCompany(null);
      resetForm();
      loadCompanies();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar empresa');
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      cnpj: company.cnpj || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;
    try {
      await apiClient.deleteCompany(id);
      loadCompanies();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao excluir empresa');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cnpj: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  const openCreateModal = () => {
    setEditingCompany(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 sm:py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Empresas
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Gerencie as empresas cadastradas
          </p>
        </div>
        
        <Button
          onClick={openCreateModal}
          variant="primary"
          size="sm"
          icon={<Plus size={18} />}
          fullWidth
          className="sm:w-auto"
        >
          Nova Empresa
        </Button>
      </div>

      {/* Main Content */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {companies.map((company) => (
            <Card 
              key={company.id}
              className="hover:border-gray-300 transition-colors"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      {company.name}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(company)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3 text-sm">
                  {company.cnpj && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Building2 className="w-4 h-4" />
                      <span>CNPJ: {company.cnpj}</span>
                    </div>
                  )}
                  {company.email && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{company.email}</span>
                    </div>
                  )}
                  {company.phone && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{company.phone}</span>
                    </div>
                  )}
                  {company.address && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{company.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              {company._count && (
                <CardFooter>
                  <div className="flex gap-6 text-sm w-full">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <FolderKanban className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-semibold">
                        {company._count.projects} {company._count.projects === 1 ? 'obra' : 'obras'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold">
                        {company._count.users} {company._count.users === 1 ? 'usuário' : 'usuários'}
                      </span>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>

        {companies.length === 0 && (
          <Card className="text-center py-12 sm:py-16">
            <CardContent>
              <div className="inline-flex p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4 sm:mb-6">
                <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Nenhuma empresa cadastrada</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto px-4">
                Comece criando sua primeira empresa
              </p>
              <Button onClick={openCreateModal} variant="primary" icon={<Plus size={18} />}>
                Criar Primeira Empresa
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCompany(null);
        }}
        title={editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
        description="Preencha os dados da empresa"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setShowModal(false);
                setEditingCompany(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingCompany ? 'Atualizar' : 'Criar'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Empresa"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            icon={<Building2 size={20} />}
          />
          <Input
            label="CNPJ"
            type="text"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            icon={<Mail size={20} />}
          />
          <Input
            label="Telefone"
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            icon={<Phone size={20} />}
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Endereço
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-none hover:border-gray-400 dark:hover:border-gray-500"
              rows={3}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
